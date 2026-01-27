package edu.columbia.corefellowship.applications.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class GcsConfig {

  private final GcsProperties gcsProperties;

  public GcsConfig(GcsProperties gcsProperties) {
    this.gcsProperties = gcsProperties;
  }

  @Bean
  public Storage storage() throws IOException {
    GoogleCredentials credentials;

    // Check if credentials JSON is provided as environment variable (for Cloud Run)
    String credentialsJson = System.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON");
    if (credentialsJson != null && !credentialsJson.isEmpty()) {
      // Parse credentials from JSON string
      credentials = GoogleCredentials.fromStream(
          new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
      );
    } else {
      // Fall back to file path (for local development)
      credentials = GoogleCredentials.fromStream(
          new FileInputStream(gcsProperties.getCredentialsPath())
      );
    }

    return StorageOptions.newBuilder()
        .setCredentials(credentials)
        .setProjectId(gcsProperties.getProjectId())
        .build()
        .getService();
  }
}