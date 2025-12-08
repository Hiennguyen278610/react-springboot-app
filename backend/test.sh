#!/bin/bash

# ============================================================
# Script kiểm thử với lựa chọn loại test
# ============================================================

# Đường dẫn đến các thư mục test
BASE_TEST_PATH="src/test/java/com/flogin/backend"
UNIT_DIR="$BASE_TEST_PATH/unit"
MOCK_DIR="$BASE_TEST_PATH/mock"
INTEGRATION_DIR="$BASE_TEST_PATH/integration"

# Màu sắc cho terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ============================================================
# Hàm comment toàn bộ file Java trong một thư mục
# Sử dụng cú pháp /* ... */ để comment block toàn bộ file
# ============================================================
comment_java_files() {
    local dir=$1
    if [ -d "$dir" ]; then
        for file in "$dir"/*.java; do
            if [ -f "$file" ]; then
                # Kiểm tra file đã được comment chưa
                if ! head -1 "$file" | grep -q "^/\* COMMENTED_BY_TEST_SCRIPT"; then
                    # Thêm comment block vào đầu và cuối file
                    {
                        echo "/* COMMENTED_BY_TEST_SCRIPT"
                        cat "$file"
                        echo "*/"
                    } > "$file.tmp" && mv "$file.tmp" "$file"
                    echo -e "  ${YELLOW}📝 Commented:${NC} $file"
                fi
            fi
        done
    fi
}

# ============================================================
# Hàm uncomment file Java trong một thư mục
# Xóa comment block được thêm bởi script
# ============================================================
uncomment_java_files() {
    local dir=$1
    if [ -d "$dir" ]; then
        for file in "$dir"/*.java; do
            if [ -f "$file" ]; then
                # Kiểm tra file có được comment bởi script không
                if head -1 "$file" | grep -q "^/\* COMMENTED_BY_TEST_SCRIPT"; then
                    # Xóa dòng đầu (/* COMMENTED_BY_TEST_SCRIPT) và dòng cuối (*/)
                    sed -i '1d;$d' "$file"
                    echo -e "  ${GREEN}✅ Uncommented:${NC} $file"
                fi
            fi
        done
    fi
}

# ============================================================
# Hàm comment tất cả các thư mục test
# ============================================================
comment_all_tests() {
    echo -e "\n${CYAN}🔒 Đang comment tất cả các file test...${NC}\n"
    comment_java_files "$UNIT_DIR"
    comment_java_files "$MOCK_DIR"
    comment_java_files "$INTEGRATION_DIR"
    echo -e "\n${GREEN}✅ Đã comment tất cả các file test!${NC}"
}

# ============================================================
# Hàm uncomment tất cả các thư mục test (cleanup)
# ============================================================
uncomment_all_tests() {
    echo -e "\n${CYAN}🔓 Đang uncomment tất cả các file test...${NC}\n"
    uncomment_java_files "$UNIT_DIR"
    uncomment_java_files "$MOCK_DIR"
    uncomment_java_files "$INTEGRATION_DIR"
    echo -e "\n${GREEN}✅ Đã uncomment tất cả các file test!${NC}"
}

# ============================================================
# Hàm chạy test và mở báo cáo
# ============================================================
run_tests() {
    echo -e "\n${BLUE}🚀 Đang chạy Maven tests...${NC}\n"
    mvn clean verify
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✅ Tests completed successfully!${NC}"
        echo -e "${CYAN}📊 Đang mở báo cáo JaCoCo...${NC}\n"
        xdg-open target/site/jacoco/index.html 2>/dev/null || \
        open target/site/jacoco/index.html 2>/dev/null || \
        echo -e "${YELLOW}⚠️  Không thể mở báo cáo tự động. Vui lòng mở: target/site/jacoco/index.html${NC}"
    else
        echo -e "\n${RED}❌ Tests failed!${NC}"
    fi
}

# ============================================================
# Hàm hiển thị menu
# ============================================================
show_menu() {
    clear
    echo -e "${BOLD}${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║           🧪 FLOGIN TEST COVERAGE RUNNER 🧪                  ║"
    echo "║                                                              ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║                                                              ║"
    echo -e "║   ${GREEN}[1]${BLUE} 📦 Unit Test Coverage                                  ║"
    echo -e "║       ${NC}${CYAN}Chạy các test trong folder: unit/${BLUE}                      ║"
    echo "║                                                              ║"
    echo -e "║   ${GREEN}[2]${BLUE} 🔧 Mock Test Coverage                                  ║"
    echo -e "║       ${NC}${CYAN}Chạy các test trong folder: mock/${BLUE}                      ║"
    echo "║                                                              ║"
    echo -e "║   ${GREEN}[3]${BLUE} 🌐 Integration Test Coverage                           ║"
    echo -e "║       ${NC}${CYAN}Chạy các test trong folder: integration/${BLUE}               ║"
    echo "║                                                              ║"
    echo -e "║   ${GREEN}[4]${BLUE} 🎯 All Tests Coverage                                  ║"
    echo -e "║       ${NC}${CYAN}Chạy tất cả các loại test${BLUE}                              ║"
    echo "║                                                              ║"
    echo -e "║   ${GREEN}[5]${BLUE} 🔓 Uncomment All (Reset)                               ║"
    echo -e "║       ${NC}${CYAN}Khôi phục tất cả file test về trạng thái ban đầu${BLUE}       ║"
    echo "║                                                              ║"
    echo -e "║   ${RED}[0]${BLUE} ❌ Thoát                                               ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# ============================================================
# Hàm xử lý lựa chọn
# ============================================================
process_choice() {
    local choice=$1
    
    case $choice in
        1)
            echo -e "\n${BOLD}${GREEN}▶ Chạy Unit Test Coverage${NC}\n"
            comment_all_tests
            echo ""
            uncomment_java_files "$UNIT_DIR"
            run_tests
            ;;
        2)
            echo -e "\n${BOLD}${GREEN}▶ Chạy Mock Test Coverage${NC}\n"
            comment_all_tests
            echo ""
            uncomment_java_files "$MOCK_DIR"
            run_tests
            ;;
        3)
            echo -e "\n${BOLD}${GREEN}▶ Chạy Integration Test Coverage${NC}\n"
            comment_all_tests
            echo ""
            uncomment_java_files "$INTEGRATION_DIR"
            run_tests
            ;;
        4)
            echo -e "\n${BOLD}${GREEN}▶ Chạy All Tests Coverage${NC}\n"
            uncomment_all_tests
            run_tests
            ;;
        5)
            uncomment_all_tests
            echo -e "\n${GREEN}✅ Đã reset tất cả file test!${NC}"
            ;;
        0)
            echo -e "\n${YELLOW}👋 Tạm biệt!${NC}\n"
            exit 0
            ;;
        *)
            echo -e "\n${RED}❌ Lựa chọn không hợp lệ!${NC}"
            ;;
    esac
}

# ============================================================
# Main script
# ============================================================
main() {
    # Kiểm tra đang ở đúng thư mục backend
    if [ ! -f "pom.xml" ]; then
        echo -e "${RED}❌ Error: Vui lòng chạy script này từ thư mục backend (chứa pom.xml)${NC}"
        exit 1
    fi
    
    # Kiểm tra thư mục test tồn tại
    if [ ! -d "$BASE_TEST_PATH" ]; then
        echo -e "${RED}❌ Error: Không tìm thấy thư mục test: $BASE_TEST_PATH${NC}"
        exit 1
    fi

    while true; do
        show_menu
        echo -ne "${BOLD}${YELLOW}👉 Nhập lựa chọn của bạn [0-5]: ${NC}"
        read -r choice
        process_choice "$choice"
        
        if [ "$choice" != "0" ]; then
            echo ""
            echo -ne "${CYAN}Nhấn Enter để tiếp tục...${NC}"
            read -r
        fi
    done
}

# Chạy script
main