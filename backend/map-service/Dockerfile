FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Build the application first
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:resolve

COPY src ./src
RUN ./mvnw package -DskipTests

# Create a directory for application data
VOLUME ["/app/data"]

ENTRYPOINT ["java", "-jar", "target/mcots-map-service-0.0.1-SNAPSHOT.jar"]