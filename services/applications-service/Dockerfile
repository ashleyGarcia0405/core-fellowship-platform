FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY gradle.properties .

# Copy all service source code
COPY identity-service identity-service
COPY api-gateway api-gateway
COPY applications-service applications-service

# Build only applications-service
RUN ./gradlew :applications-service:bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR
COPY --from=builder /build/applications-service/build/libs/*.jar app.jar

# Cloud Run requires port 8080
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]