FROM eclipse-temurin:17-jre
# 2. Creamos una carpeta limpia DENTRO del contenedor Linux
WORKDIR /app
# 3. Tu enfoque genérico: agarra cualquier .jar de la carpeta target local
ARG JAR_FILE=target/*.jar
# 4. Lo copia adentro de la carpeta /app del contenedor
COPY ${JAR_FILE} app.jar
# 5. Exponemos el puerto
EXPOSE 8080
# 6. Ejecutamos (como estamos en /app, no necesitamos poner /app.jar)
ENTRYPOINT ["java", "-jar", "app.jar"]