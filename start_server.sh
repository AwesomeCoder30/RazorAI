#!/bin/bash

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
readonly BACKEND_PORT=5001
readonly FRONTEND_PORT=3000
readonly STARTUP_TIMEOUT=30
readonly HEALTH_CHECK_RETRIES=5

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Global variables for process tracking
BACKEND_PID=""
FRONTEND_PID=""
CURRENT_STEP=0
TOTAL_STEPS=6
PROJECT_ROOT=""

# Logging functions with step counter
next_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
}

log_step() {
    echo -ne "${BLUE}[$CURRENT_STEP/$TOTAL_STEPS]${NC} $1...\r"
}

log_step_success() {
    echo -e "\r\033[K${GREEN}[$CURRENT_STEP/$TOTAL_STEPS]${NC} ✓ $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_info_inline() {
    echo -ne "${BLUE}[INFO]${NC} $1\r"
}

log_success() {
    echo -e "\r\033[K${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "\r\033[K${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "\r\033[K${RED}[ERROR]${NC} $1" >&2
}

# Clear current line and show spinner
show_spinner() {
    local message="$1"
    local pid="$2"
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) %10 ))
        printf "\r\033[K${BLUE}[INFO]${NC} %s %s" "${spin:$i:1}" "$message"
        sleep 0.1
    done
    printf "\r\033[K"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for service to be ready with timeout
wait_for_service() {
    local url="$1"
    local service_name="$2"
    local retries=0
    
    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        if curl -sf "$url" >/dev/null 2>&1; then
            log_success "$service_name is ready at $url"
            return 0
        fi
        
        retries=$((retries + 1))
        log_info_inline "Waiting for $service_name... (attempt $retries/$HEALTH_CHECK_RETRIES)"
        sleep 3
    done
    
    log_error "$service_name failed to start within timeout"
    return 1
}

# Cleanup function
cleanup() {
    log_info "Shutting down servers..."
    
    # Kill specific PIDs first
    if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    # Cleanup any remaining processes
    pkill -f "tsx watch" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    log_success "Servers stopped"
    exit 0
}

# Check prerequisites
check_prerequisites() {
    next_step
    log_step "Checking prerequisites"
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please install the missing dependencies and try again"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_warning "Node.js version $node_version detected. RazorAI requires Node.js 18 or higher"
        log_warning "Consider upgrading Node.js for better performance"
    fi
    
    log_step_success "Prerequisites verified"
}

# Check and setup environment
setup_environment() {
    next_step
    log_step "Setting up environment"
    
    # Store project root for later use
    PROJECT_ROOT=$(pwd)
    
    # Check if .env file exists
    if [[ ! -f ".env" ]]; then
        log_warning ".env file not found. Creating from template..."
        cat > .env << EOF
# Groq API Configuration (get your key from https://console.groq.com/)
GROQ_API_KEY=your_groq_api_key_here

# Hugging Face API (optional)
# HUGGING_FACE_API_KEY=your_hugging_face_token_here

# Ollama Configuration (optional - for local LLM)
# OLLAMA_BASE_URL=http://localhost:11434

# Server Configuration
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000
EOF
        log_warning "Please edit .env file and add your API keys"
    fi
    
    log_step_success "Environment setup complete"
}

# Setup backend
setup_backend() {
    next_step
    log_step "Setting up backend dependencies"
    
    if [[ ! -d "backend" ]]; then
        log_error "Backend directory not found. Are you in the correct project root?"
        exit 1
    fi
    
    cd backend
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found in backend directory"
        exit 1
    fi
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        local npm_log=$(mktemp)
        if ! npm install > "$npm_log" 2>&1; then
            log_error "Failed to install backend dependencies"
            echo "NPM error output:"
            cat "$npm_log"
            rm -f "$npm_log"
            exit 1
        fi
        rm -f "$npm_log"
    fi
    
    # Build TypeScript if needed
    if [[ ! -d "dist" ]] || [[ "src" -nt "dist" ]]; then
        local build_log=$(mktemp)
        if ! npm run build > "$build_log" 2>&1; then
            log_error "Failed to build backend TypeScript"
            echo "Build error output:"
            cat "$build_log"
            rm -f "$build_log"
            exit 1
        fi
        rm -f "$build_log"
    fi
    
    log_step_success "Backend dependencies ready"
}

# Start backend server
start_backend() {
    next_step
    log_step "Starting backend server"
    
    # Check if port is already in use
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        pkill -f "tsx watch" 2>/dev/null || true
        sleep 2
    fi
    
    # Start backend - capture output for error logging
    local backend_log=$(mktemp)
    npm run dev > "$backend_log" 2>&1 &
    BACKEND_PID=$!
    
    # Give backend a moment to start
    sleep 3
    
    # Verify backend started - try health endpoint first, then root
    local retries=0
    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        if curl -sf "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1 || \
           curl -sf "http://localhost:$BACKEND_PORT/" >/dev/null 2>&1; then
            log_step_success "Backend server running on port $BACKEND_PORT"
            rm -f "$backend_log"
            return 0
        fi
        retries=$((retries + 1))
        sleep 1
    done
    
    log_error "Backend startup failed"
    echo "Backend error output:"
    cat "$backend_log"
    rm -f "$backend_log"
    cleanup
    exit 1
}

# Setup frontend
setup_frontend() {
    next_step
    log_step "Setting up frontend server"

    cd "$PROJECT_ROOT/frontend"
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found in frontend directory"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist or package.json is newer
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        local npm_log=$(mktemp)
        if ! npm install > "$npm_log" 2>&1; then
            log_error "Failed to install frontend dependencies"
            echo "NPM error output:"
            cat "$npm_log"
            rm -f "$npm_log"
            exit 1
        fi
        rm -f "$npm_log"
    fi
    
    log_step_success "Frontend setup complete"
}

# Start frontend server
start_frontend() {
    next_step
    log_step "Starting frontend server"
    
    # Check if port is already in use
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        pkill -f "vite" 2>/dev/null || true
        sleep 2
    fi
    
    # Start frontend - capture output for error logging
    local frontend_log=$(mktemp)
    npm run dev > "$frontend_log" 2>&1 &
    FRONTEND_PID=$!
    
    # Give frontend more time to start
    sleep 5
    
    # Wait for frontend
    local retries=0
    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        if curl -sf "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
            log_step_success "Frontend server running on port $FRONTEND_PORT"
            rm -f "$frontend_log"
            return 0
        fi
        retries=$((retries + 1))
        sleep 2
    done
    
    # Check if process is still running even if health check failed
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_step_success "Frontend server started (may still be initializing)"
        rm -f "$frontend_log"
        return 0
    else
        log_error "Frontend startup failed"
        echo "Frontend error output:"
        cat "$frontend_log"
        rm -f "$frontend_log"
        cleanup
        exit 1
    fi
}

# Display startup information
show_startup_info() {
    echo ""
    echo "🚀 RazorAI servers started successfully!"
    echo ""
    echo "🎨 Frontend:  http://localhost:$FRONTEND_PORT"
    echo "🔧 Backend:   http://localhost:$BACKEND_PORT"
    echo "📚 API Docs:  http://localhost:$BACKEND_PORT/api/generate/test"
    echo "🔍 Providers: http://localhost:$BACKEND_PORT/api/generate/providers"
    echo ""
    echo "💡 Server logs will appear below. Press Ctrl+C to stop all servers"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    
    # Now restart servers without output suppression to show logs
    log_info "Restarting servers with logging enabled..."
    
    # Kill current processes
    if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    # Wait for processes to stop
    sleep 3
    
    # Restart with logging enabled using stored project root
    cd "$PROJECT_ROOT/backend"
    npm run dev &
    BACKEND_PID=$!
    
    cd "$PROJECT_ROOT/frontend"
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
}

# Main execution
main() {
    echo "🚀 Starting RazorAI servers..."
    echo ""
    
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM EXIT
    
    check_prerequisites
    setup_environment
    setup_backend
    start_backend
    setup_frontend
    start_frontend
    show_startup_info
    
    # Keep script running
    while true; do
        # Check if processes are still running
        if [[ -n "$BACKEND_PID" ]] && ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            log_error "Backend process died unexpectedly"
            exit 1
        fi
        
        if [[ -n "$FRONTEND_PID" ]] && ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
            log_error "Frontend process died unexpectedly"
            exit 1
        fi
        
        sleep 5
    done
}

# Run main function
main "$@"
