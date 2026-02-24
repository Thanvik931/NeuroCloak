# NeuroCloak Architecture Documentation

## Overview

NeuroCloak is a Cognitive Digital Twin (CDT) platform designed to monitor, evaluate, and govern AI models in real-time. The platform acts as a digital twin of ML systems, providing comprehensive insights into model behavior, performance, and compliance.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   React App     │  │   Dashboard UI  │  │   Auth Pages    │  │
│  │   (Vite +       │  │   (Tailwind +   │  │   (JWT Flow)    │  │
│  │    shadcn/ui)   │  │    Recharts)    │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS/WebSocket
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway Layer                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     Nginx       │  │   Rate Limit   │  │   CORS/CSRF     │                 │
│  │   (Reverse      │  │   (Django-     │  │   Protection    │                 │
│  │    Proxy)       │  │    throttling)  │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP/WebSocket
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Backend Layer                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   Django DRF    │  │   WebSocket     │  │   Celery        │                 │
│  │   (REST APIs)   │  │   (Django       │  │   (Background   │                 │
│  │                 │  │    Channels)    │  │    Tasks)       │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          Django Apps                                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │ │
│  │  │ Accounts │ │ Orgs     │ │ Projects │ │ Registry │         │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │ │
│  │  │Ingestion│ │Evaluations│ │  Alerts   │ │  Audit    │         │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Interactions

#### 1. Data Flow
```
Model Predictions → Ingestion API → MongoDB → Celery Tasks → Evaluation Engines → Trust Score → Alerts
```

#### 2. Real-time Communication
```
Frontend → WebSocket → Django Channels → Consumers → Real-time Updates
```

#### 3. Authentication Flow
```
Frontend → Login API → JWT Token → Protected Routes → API Requests
```

## Design Decisions

### 1. Database Choice: MongoDB + SQLite

**Decision**: Hybrid approach using MongoDB for high-volume data and SQLite for Django metadata.

**Rationale**:
- **MongoDB**: Excellent for time-series data (predictions, evaluations, metrics)
- **Schema flexibility**: Easy to evolve evaluation metrics and alert configurations
- **Scalability**: Horizontal scaling for large datasets
- **Performance**: Optimized for read-heavy workloads

**Trade-offs**:
- No SQL joins (mitigated by denormalization)
- Eventual consistency (acceptable for monitoring use case)

### 2. Backend Framework: Django + DRF

**Decision**: Django with Django REST Framework.

**Rationale**:
- **Mature ecosystem**: Extensive libraries and community support
- **Admin interface**: Built-in admin for data management
- **Security**: Robust authentication and permissions
- **Rapid development**: ORM, migrations, admin panel

**Trade-offs**:
- Monolithic structure (mitigated by app separation)
- Performance overhead (acceptable with proper optimization)

### 3. Frontend Framework: React + Vite

**Decision**: React with Vite, TypeScript, and Tailwind CSS.

**Rationale**:
- **Developer experience**: Fast HMR and build times
- **Type safety**: TypeScript for better code quality
- **Modern tooling**: Vite's optimized build process
- **Styling**: Utility-first CSS with Tailwind

**Trade-offs**:
- Bundle size (mitigated with code splitting)
- Learning curve for Tailwind CSS

### 4. State Management: Zustand

**Decision**: Zustand for state management.

**Rationale**:
- **Simplicity**: Minimal boilerplate compared to Redux
- **TypeScript support**: Excellent TS integration
- **Performance**: Optimized re-renders
- **DevTools**: Built-in debugging tools

### 5. Task Queue: Celery + Redis

**Decision**: Celery with Redis as broker.

**Rationale**:
- **Reliability**: Robust task execution and retries
- **Scalability**: Horizontal scaling of workers
- **Monitoring**: Built-in monitoring and management
- **Flexibility**: Supports scheduled and periodic tasks

## CDT Concept Mapping

### 1. Digital Twin Components

| Physical Twin Component | Digital Twin Component | Implementation |
|---------------------|-------------------|-------------|
| Model Behavior | Prediction Logging | Ingestion API + MongoDB |
| Performance Metrics | Evaluation Results | Evaluation Engines |
| Health Status | Trust Score | Trust Score Calculation |
| Environmental Context | Data Drift | Drift Detection |
| Decision Process | Explainability | SHAP Analysis |
| Compliance | Audit Trail | Audit Logging |

### 2. Real-time Synchronization

The digital twin maintains synchronization through:

1. **Data Ingestion**: Real-time prediction capture via WebSocket
2. **Continuous Evaluation**: Background tasks process new data
3. **Live Updates**: WebSocket pushes updates to frontend
4. **State Reflection**: Trust score reflects current system state

## Data Models

### Core Entities

#### User & Organization
```python
User (Django Model)
├── UserProfile
└── APIKey

Organization (Django Model)
├── OrganizationMember
└── OrganizationInvitation

Project (Django Model)
├── ProjectMember
├── ProjectAPIKey
└── ProjectConfiguration
```

#### Model & Evaluation
```python
Model (Django Model)
├── ModelVersion
├── ModelEndpoint
└── ModelDocumentation

Evaluation (MongoDB)
├── FairnessEvaluation
├── DriftEvaluation
├── RobustnessEvaluation
└── ExplainabilityEvaluation
```

#### Monitoring & Alerting
```python
TrustScore (MongoDB)
├── Component scores
├── Trend analysis
└── Alert triggers

Alert (MongoDB)
├── Rule configurations
├── Notification channels
└── Escalation logic
```

## Security Architecture

### 1. Authentication & Authorization

**JWT Token Strategy**:
- Access tokens: 1 hour validity
- Refresh tokens: 7 days validity
- Automatic refresh on expiration
- Secure storage with httpOnly cookies

**Role-Based Access Control (RBAC)**:
- **Owner**: Full permissions
- **Admin**: Manage members and settings
- **Member**: Read/write access
- **Viewer**: Read-only access

### 2. API Security

**Rate Limiting**:
- Per-endpoint configurable limits
- User-based throttling
- API key rate limiting for ingestion
- DDoS protection

**Input Validation**:
- Pydantic schemas for request validation
- SQL injection prevention
- XSS protection
- File upload restrictions

### 3. Data Protection

**Encryption**:
- Sensitive data encryption at rest
- Password hashing with bcrypt
- API key generation with UUID
- Secure token storage

**Audit Logging**:
- Immutable audit trail
- Comprehensive event logging
- Compliance tracking
- Data access monitoring

## Performance Optimizations

### 1. Database Optimizations

**MongoDB Indexes**:
```javascript
// Compound indexes for common queries
{ "project_id": 1, "model_id": 1, "timestamp": -1 }
{ "project_id": 1, "alert_type": 1, "status": 1 }
{ "user_id": 1, "timestamp": -1 }
```

**Query Optimization**:
- Projection to limit returned fields
- Aggregation pipelines for analytics
- Pagination for large datasets
- Connection pooling

### 2. Caching Strategy

**Redis Caching**:
- API response caching (short TTL)
- Session storage
- Rate limit counters
- Background task results

**Application Caching**:
- Model metadata caching
- User session caching
- Permission caching
- Configuration caching

### 3. Frontend Optimizations

**Code Splitting**:
- Route-based code splitting
- Lazy loading for heavy components
- Dynamic imports for large libraries

**Performance**:
- React.memo for component memoization
- useCallback/useMemo for expensive computations
- Virtualization for large lists

## Scalability Considerations

### 1. Horizontal Scaling

**Backend**:
- Multiple Gunicorn workers
- Celery worker scaling
- Database read replicas
- Load balancer configuration

**Frontend**:
- CDN for static assets
- Multiple server instances
- Database connection pooling
- Session affinity considerations

### 2. Data Scaling

**MongoDB**:
- Sharding by organization/project
- Index optimization for large datasets
- Archive policies for old data
- Connection pooling

**Redis**:
- Cluster configuration
- Memory optimization
- Persistence configuration
- Failover setup

## Monitoring & Observability

### 1. Application Monitoring

**Health Checks**:
- Service health endpoints
- Database connectivity checks
- External service monitoring
- Dependency health tracking

**Performance Metrics**:
- Request/response times
- Error rates and types
- Database query performance
- Memory and CPU usage

### 2. Business Intelligence

**KPIs Tracked**:
- Model prediction volume
- Evaluation completion rates
- Alert response times
- User engagement metrics
- System uptime

**Alerting**:
- Service downtime alerts
- Performance degradation alerts
- Security incident notifications
- Capacity planning alerts

## Technology Trade-offs

### 1. MongoDB vs PostgreSQL

**Chosen**: MongoDB for flexibility

**Benefits**:
- Schema flexibility for evolving metrics
- Better performance for time-series data
- Easier horizontal scaling
- Native document storage

**Drawbacks**:
- No relational constraints
- Limited transaction support
- Learning curve for team

### 2. Monolith vs Microservices

**Chosen**: Monolithic with app separation

**Benefits**:
- Simpler deployment
- Shared database transactions
- Easier development
- Lower operational complexity

**Drawbacks**:
- Technology lock-in
- Scalability limitations
- Coupling between components

### 3. Real-time vs Batch Processing

**Chosen**: Hybrid approach

**Benefits**:
- Real-time insights where needed
- Batch processing for heavy computations
- Optimal resource utilization
- User experience balance

**Drawbacks**:
- System complexity
- Data consistency challenges
- Debugging complexity

## Future Architecture Evolution

### Phase 1: Current (Monolithic)
- Single deployment unit
- Shared database
- Integrated services

### Phase 2: Service Separation
- Extract evaluation service
- Separate alert service
- Independent deployments

### Phase 3: Microservices
- Fully distributed architecture
- Service mesh communication
- Independent scaling

### Phase 4: Event-Driven
- Event sourcing architecture
- CQRS pattern
- Event-driven communication

## Conclusion

The NeuroCloak architecture balances complexity with functionality, providing a solid foundation for AI model monitoring and governance. The hybrid approach allows for rapid development while maintaining scalability options for future growth.

The CDT concept is implemented through continuous data ingestion, real-time evaluation, and comprehensive monitoring, creating a true digital twin that reflects the state and behavior of AI models in production.
