package edu.columbia.corefellowship.applications.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class GcsConfig {

  private final GcsProperties gcsProperties;

  public GcsConfig(GcsProperties gcsProperties) {
    this.gcsProperties = gcsProperties;
  }

  @Bean
  public Storage storage() throws IOException {
    GoogleCredentials credentials = GoogleCredentials.fromStream(
        new FileInputStream(gcsProperties.getCredentialsPath())
    );

    return StorageOptions.newBuilder()
        .setCredentials(credentials)
        .setProjectId(gcsProperties.getProjectId())
        .build()
        .getService();
  }
}