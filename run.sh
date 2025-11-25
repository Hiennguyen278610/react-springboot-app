#!/bin/bash

# Script chạy cả Backend (Spring Boot) và Frontend (React)
# Nhấn Ctrl+C để dừng tất cả

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

BACKEND_PID=""
FRONTEND_PID=""

# Load biến môi trường
if [ -f "$BACKEND_DIR/.env" ]; then
    set -a
    source "$BACKEND_DIR/.env"
    set +a
fi

if [ -f "$FRONTEND_DIR/.env" ]; then
    set -a
    source "$FRONTEND_DIR/.env"
    set +a
fi

# Dọn dẹp khi thoát
cleanup() {
    echo ""
    echo "Đang dừng các service..."
    
    if [ -n "$BACKEND_PID" ]; then
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi
    
    if [ -n "$FRONTEND_PID" ]; then
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    echo "Đã dừng tất cả service"
    exit 0
}

trap cleanup EXIT INT TERM

# Kiểm tra các công nghệ cần thiết
checkTechnologies() {
    echo "Kiểm tra công nghệ..."
    
    if ! command -v java &> /dev/null; then
        echo "Lỗi: Chưa cài Java. Cần Java 17+"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "Lỗi: Chưa cài Node.js. Cần Node 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "Lỗi: Chưa cài npm"
        exit 1
    fi
    
    echo "✓ Đã cài đủ công nghệ"
}

# Kiểm tra dependencies của Backend
checkBackendDependencies() {
    echo "Kiểm tra backend dependencies..."
    
    cd "$BACKEND_DIR"
    
    if [ ! -f "./mvnw" ]; then
        echo "Lỗi: Không tìm thấy Maven wrapper"
        exit 1
    fi
    
    chmod +x ./mvnw
    echo "✓ Backend dependencies OK"
}

# Kiểm tra packages của Frontend
checkFrontendPackage() {
    echo "Kiểm tra frontend packages..."
    
    cd "$FRONTEND_DIR"
    
    if [ ! -f "package.json" ]; then
        echo "Lỗi: Không tìm thấy package.json"
        exit 1
    fi
    
    echo "✓ Frontend package OK"
}

# Chạy Backend
runBackend() {
    echo "Đang clean và khởi động backend..."
    
    cd "$BACKEND_DIR"
    ./mvnw clean -q
    ./mvnw spring-boot:run > "$SCRIPT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    echo "✓ Backend đã khởi động (PID: $BACKEND_PID)"
}

# Chạy Frontend
runFrontend() {
    echo "Đang cài đặt packages và khởi động frontend..."
    
    cd "$FRONTEND_DIR"
    npm install --silent
    npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    echo "✓ Frontend đã khởi động (PID: $FRONTEND_PID)"
}

# Main
main() {
    checkTechnologies
    checkBackendDependencies
    checkFrontendPackage
    
    echo ""
    runBackend
    sleep 16
    runFrontend
    
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║               Services đã khởi động                    ║"
    echo "╠════════════════════════════════════════════════════════╣"
    echo "║  Backend:  http://localhost:${SPRING_DATASOURCE_BACKEND_PORT}${SPRING_DATASOURCE_BACKEND_API}/          ║"
    echo "║  Frontend: http://localhost:${VITE_PORT}                       ║"
    echo "║                                                        ║"
    echo "║  Log: backend.log / frontend.log                       ║"
    echo "║  Nhấn Ctrl+C để dừng                                   ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    wait $BACKEND_PID $FRONTEND_PID
}

main
