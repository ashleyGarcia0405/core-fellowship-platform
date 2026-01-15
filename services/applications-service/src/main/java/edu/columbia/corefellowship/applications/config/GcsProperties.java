package edu.columbia.corefellowship.applications.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "gcs")
public class GcsProperties {

  private String bucketName;
  private String credentialsPath;
  private String projectId;

  public String getBucketName() {
    return bucketName;
  }

  public void setBucketName(String bucketName) {
    this.bucketName = bucketName;
  }

  public String getCredentialsPath() {
    return credentialsPath;
  }

  public void setCredentialsPath(String credentialsPath) {
    this.credentialsPath = credentialsPath;
  }

  public String getProjectId() {
    return projectId;
  }

  public void setProjectId(String projectId) {
    this.projectId = projectId;
  }
}