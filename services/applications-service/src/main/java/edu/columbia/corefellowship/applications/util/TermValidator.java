package edu.columbia.corefellowship.applications.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

public class TermValidator {

  private static final Pattern TERM_PATTERN =
      Pattern.compile("^(Spring|Summer|Fall) \\d{4}$");

  private TermValidator() {}

  public static boolean isValid(String term) {
    return term != null && TERM_PATTERN.matcher(term).matches();
  }

  public static void validate(String term) {
    if (!isValid(term)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Invalid term format. Use 'Spring YYYY', 'Summer YYYY', or 'Fall YYYY'");
    }
  }
}