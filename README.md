# FLOGINFE_BE - Software Testing Final Project

## 📋 Project Overview

Bài tập lớn môn **Kiểm thử Phần mềm** - Trường Đại học Sài Gòn  
Niên khóa 2024-2025

Hệ thống quản lý **Login** và **Product** với đầy đủ testing suite bao gồm:
- Unit Testing & TDD
- Integration Testing
- Mock Testing
- E2E Automation Testing
- CI/CD Pipeline

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.5.6
- **Java Version**: 21
- **Database**: JPA/Hibernate
- **Security**: Spring Security
- **Testing**: JUnit 5, Mockito

### Frontend (React)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Testing**: Jest, React Testing Library, Cypress

## 🚀 Quick Start

### Prerequisites
- Java 21
- Node.js 18+
- Maven 3.9+

### Backend Setup
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test                    # Unit & Integration tests
./mvnw test -Dtest="*Mock*"    # Mock tests only
```

### Frontend Tests
```bash
cd frontend
npm test                      # Unit tests
npm run test:e2e             # E2E tests (Cypress)
```

## 📊 Test Coverage

### Required Test Cases

#### 1. Login System (40 points)
- **Unit Tests**: Controller, Service, Repository layers
- **Integration Tests**: Full API flows
- **Mock Tests**: Service & Repository mocking
- **E2E Tests**: Complete login flow automation

#### 2. Product Management (40 points)
- **CRUD Operations**: Create, Read, Update, Delete
- **Unit Tests**: All layers with TDD approach
- **Integration Tests**: API endpoints
- **Mock Tests**: Repository & Service mocking
- **E2E Tests**: Full user workflows

### Bonus Features (20 points)
- **Performance Testing**: JMeter/k6 for load & stress tests
- **Security Testing**: Vulnerability assessment

## 🔄 CI/CD Pipeline

GitHub Actions workflow includes:
- Backend testing (JUnit, Mockito)
- Frontend testing (Jest, Cypress)
- Code coverage reports
- Automated deployment

## 📁 Project Structure

```
FLOGINFE_BE/
├── backend/                 # Spring Boot application
│   ├── src/
│   │   ├── main/java/com/flogin/
│   │   │   ├── controller/   # REST controllers
│   │   │   ├── service/      # Business logic
│   │   │   ├── repository/   # Data access
│   │   │   ├── entity/       # JPA entities
│   │   │   └── dto/          # Data transfer objects
│   │   └── test/             # Test classes
│   └── pom.xml
├── frontend/                # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── tests/           # Unit tests
│   │   └── utils/           # Utilities
│   ├── cypress/             # E2E tests
│   └── package.json
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## 🎯 Grading Criteria

### Code Quality (30%)
- Clean code principles
- Test structure (AAA pattern)
- Test coverage ≥ 80%
- All tests pass

### Documentation (20%)
- Comprehensive test cases
- Screenshots & evidence
- Test reports
- Clear README

### Completeness (30%)
- All required features implemented
- Full test suite for Login & Product
- Working CI/CD pipeline

### Best Practices (20%)
- TDD implementation
- Proper mocking strategy
- Test data management
- Automation standards

## 📝 Submission Requirements

### Source Code
- **Repository**: GitHub/GitLab (public or add instructor)
- **Commits**: Clear history
- **README**: Comprehensive documentation
- **.gitignore**: Proper exclusions

### Report (PDF, max 50 pages)
- Project introduction
- Detailed test cases (Login + Product)
- Test execution results
- Screenshots & evidence
- Coverage reports
- CI/CD documentation
- Conclusions

### Deadline
**11/11/2025** - No late submissions accepted

## 👥 Team
- **Course**: Software Testing
- **Institution**: Saigon University
- **Academic Year**: 2024-2025

## 📚 References
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Cypress](https://docs.cypress.io/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)