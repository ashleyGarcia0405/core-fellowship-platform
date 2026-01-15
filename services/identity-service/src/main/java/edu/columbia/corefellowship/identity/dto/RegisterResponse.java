package edu.columbia.corefellowship.identity.dto;

import edu.columbia.corefellowship.identity.model.UserType;

public class RegisterResponse {

  private String userId;
  private String email;
  private UserType userType;
  private String message;

  // Constructors
  public RegisterResponse() {
  }

  public RegisterResponse(String userId, String email, UserType userType, String message) {
    this.userId = userId;
    this.email = email;
    this.userType = userType;
    this.message = message;
  }

  // Getters and Setters
  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public UserType getUserType() {
    return userType;
  }

  public void setUserType(UserType userType) {
    this.userType = userType;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}
