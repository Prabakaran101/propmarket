# ──────────────────────────────────────────────────────────
#  Backend Dockerfile — expects a pre-built JAR
#
#  USAGE:
#    1. Build JAR first:  mvn clean package -DskipTests
#    2. Then build image: docker build -t realestate-backend:1.0 .
#
#  The JAR must already exist at target/realestate-backend-1.0.0.jar
#  before running docker build. Docker does NOT compile anything here.
# ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create uploads directory for property images
RUN mkdir -p /app/uploads

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

# Copy the pre-built JAR from your local target/ folder into the image
COPY target/realestate-backend-1.0.0.jar app.jar

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
