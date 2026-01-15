package edu.columbia.corefellowship.identity.dto;

import edu.columbia.corefellowship.identity.model.UserRole;
import edu.columbia.corefellowship.identity.model.UserType;

public class LoginResponse {

  private String accessToken;
  private String tokenType;
  private Integer expiresIn;
  private String userId;
  private String email;
  private UserType userType;
  private UserRole role;

  // Constructors
  public LoginResponse() {
  }

  public LoginResponse(String accessToken, String tokenType, Integer expiresIn,
                      String userId, String email, UserType userType, UserRole role) {
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    this.expiresIn = expiresIn;
    this.userId = userId;
    this.email = email;
    this.userType = userType;
    this.role = role;
  }

  // Getters and Setters
  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public String getTokenType() {
    return tokenType;
  }

  public void setTokenType(String tokenType) {
    this.tokenType = tokenType;
  }

  public Integer getExpiresIn() {
    return expiresIn;
  }

  public void setExpiresIn(Integer expiresIn) {
    this.expiresIn = expiresIn;
  }

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

  public UserRole getRole() {
    return role;
  }

  public void setRole(UserRole role) {
    this.role = role;
  }
}
