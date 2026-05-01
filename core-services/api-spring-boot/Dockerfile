# STAGE 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
# We name the JAR explicitly here to avoid wildcards failing
RUN mvn clean package -DskipTests

# STAGE 2: Run
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Check the target folder specifically
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]