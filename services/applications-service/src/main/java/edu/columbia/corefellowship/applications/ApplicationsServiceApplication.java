package edu.columbia.corefellowship.applications;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class ApplicationsServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(ApplicationsServiceApplication.class, args);
  }
}