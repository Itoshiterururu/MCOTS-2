FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests || ./mvnw clean package -DskipTests

EXPOSE 8081

CMD ["java", "-jar", "target/mcots-auth-service-0.0.1-SNAPSHOT.jar"]