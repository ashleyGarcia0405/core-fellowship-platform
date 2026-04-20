package edu.columbia.corefellowship.applications.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.columbia.corefellowship.applications.config.OpenAiProperties;
import edu.columbia.corefellowship.applications.model.AiRecommendation;
import edu.columbia.corefellowship.applications.model.Interview;
import edu.columbia.corefellowship.applications.model.MatchPreference.RoleReference;
import edu.columbia.corefellowship.applications.model.Startup;
import edu.columbia.corefellowship.applications.model.StudentApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class OpenAiService {

  private final RestClient restClient;
  private final OpenAiProperties openAiProperties;
  private final ObjectMapper objectMapper;

  public OpenAiService(OpenAiProperties openAiProperties) {
    this.openAiProperties = openAiProperties;
    this.objectMapper = new ObjectMapper();
    this.restClient = RestClient.builder()
        .baseUrl("https://api.openai.com")
        .build();
  }

  public List<AiRecommendation.RoleScore> generateRecommendations(
      String resumeText,
      StudentApplication application,
      Interview interview,
      List<Startup> startups,
      List<RoleReference> rankedRoles) {

    if (openAiProperties.getApiKey() == null || openAiProperties.getApiKey().isBlank()) {
      throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
          "OpenAI API key is not configured");
    }

    String rolesDescription = buildRolesDescription(startups, rankedRoles);
    String studentContext = buildStudentContext(resumeText, application, interview);

    String systemPrompt = """
        You are an expert career matcher for a university fellowship program that places students \
        at startups. Given a student's profile, score each available role on a 1-10 scale for fit. \
        Return ONLY a JSON object with a "scores" key containing an array of objects, each with: \
        startupId (string), positionIndex (int), score (int 1-10), reasoning (string, 1-2 sentences). \
        Prioritize roles that align with the student's stated role preferences, major, and interview \
        interests. Consider industry alignment explicitly and do NOT favor well-known startups. \
        For technical roles (engineering, ML, data), weigh technical depth from resume/interview heavily. \
        Penalize technical roles if evidence of technical depth is weak. \
        Penalize roles that conflict with expressed role/industry interests or work constraints. \
        Prioritize candidates with STRONG_YES or YES interview recommendations. \
        Consider skills match, role interest alignment, industry, and work style compatibility.""";

    String userPrompt = String.format("""
        ## Student Profile
        %s

        ## Available Roles
        %s

        Total roles: %d. You must return exactly this many scores, one per role listed. \
        Score each role for this student. Return JSON with a "scores" array.""",
        studentContext, rolesDescription, rankedRoles.size());

    Map<String, Object> requestBody = Map.of(
        "model", openAiProperties.getModel(),
        "response_format", Map.of("type", "json_object"),
        "messages", List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userPrompt)
        ),
        "temperature", 0.3
    );

    Set<String> allowedRoleKeys = buildRoleKeySet(rankedRoles);
    Map<String, RoleReference> roleRefByKey = new HashMap<>();
    for (RoleReference roleRef : rankedRoles) {
      roleRefByKey.put(toRoleKey(roleRef.getStartupId(), roleRef.getPositionIndex()), roleRef);
    }
    try {
      String responseJson = restClient.post()
          .uri("/v1/chat/completions")
          .header("Authorization", "Bearer " + openAiProperties.getApiKey())
          .contentType(MediaType.APPLICATION_JSON)
          .body(requestBody)
          .retrieve()
          .body(String.class);

      JsonNode root = objectMapper.readTree(responseJson);
      String content = root.path("choices").get(0).path("message").path("content").asText();
      JsonNode parsed = objectMapper.readTree(content);
      JsonNode scoresNode = parsed.has("scores") ? parsed.get("scores") : parsed;

      List<Map<String, Object>> rawScores = objectMapper.convertValue(
          scoresNode, new TypeReference<>() {});

      List<AiRecommendation.RoleScore> roleScores = new ArrayList<>();
      Map<String, AiRecommendation.RoleScore> scoreByRoleKey = new HashMap<>();
      for (Map<String, Object> raw : rawScores) {
        AiRecommendation.RoleScore rs = new AiRecommendation.RoleScore();
        rs.setStartupId((String) raw.get("startupId"));
        rs.setPositionIndex(((Number) raw.get("positionIndex")).intValue());
        String roleKey = toRoleKey(rs.getStartupId(), rs.getPositionIndex());
        if (!allowedRoleKeys.contains(roleKey)) {
          continue;
        }
        rs.setScore(((Number) raw.get("score")).intValue());
        rs.setReasoning((String) raw.get("reasoning"));

        // Enrich with startup name and role type
        enrichRoleScore(rs, startups);
        roleScores.add(rs);
        scoreByRoleKey.put(roleKey, rs);
      }

      for (RoleReference roleRef : rankedRoles) {
        String roleKey = toRoleKey(roleRef.getStartupId(), roleRef.getPositionIndex());
        if (scoreByRoleKey.containsKey(roleKey)) {
          continue;
        }
        AiRecommendation.RoleScore fallback = new AiRecommendation.RoleScore();
        fallback.setStartupId(roleRef.getStartupId());
        fallback.setPositionIndex(roleRef.getPositionIndex());
        fallback.setScore(1);
        fallback.setReasoning("Insufficient evidence in resume/interview to support fit.");
        enrichRoleScore(fallback, startups);
        roleScores.add(fallback);
      }

      roleScores.sort(Comparator.comparingInt(AiRecommendation.RoleScore::getScore).reversed());
      return roleScores;

    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to get AI recommendations: " + e.getMessage(), e);
    }
  }

  private String buildRolesDescription(List<Startup> startups, List<RoleReference> rankedRoles) {
    Map<String, Startup> startupById = new HashMap<>();
    for (Startup startup : startups) {
      startupById.put(startup.getId(), startup);
    }
    StringBuilder sb = new StringBuilder();
    for (int rankIndex = 0; rankIndex < rankedRoles.size(); rankIndex++) {
      RoleReference roleRef = rankedRoles.get(rankIndex);
      Startup startup = startupById.get(roleRef.getStartupId());
      if (startup == null || startup.getPositions() == null) continue;
      int positionIndex = roleRef.getPositionIndex();
      if (positionIndex < 0 || positionIndex >= startup.getPositions().size()) continue;

      Startup.Position pos = startup.getPositions().get(positionIndex);
      sb.append(String.format("- **%s** at **%s** (startupId: %s, positionIndex: %d)\n",
          pos.getRoleType(), startup.getCompanyName(), startup.getId(), positionIndex));
      sb.append(String.format("  Student Rank: %d\n", rankIndex + 1));
      if (startup.getIndustry() != null && !startup.getIndustry().isBlank()) {
        sb.append(String.format("  Industry: %s\n", startup.getIndustry()));
      }
      if (startup.getDescription() != null && !startup.getDescription().isBlank()) {
        sb.append(String.format("  Company Description: %s\n", startup.getDescription()));
      }
      if (pos.getDescription() != null && !pos.getDescription().isBlank()) {
        sb.append(String.format("  Role Description: %s\n", pos.getDescription()));
      }
      if (pos.getRequiredSkills() != null && !pos.getRequiredSkills().isEmpty()) {
        sb.append(String.format("  Required Skills: %s\n", String.join(", ", pos.getRequiredSkills())));
      }
      if (pos.getTimeCommitment() != null && !pos.getTimeCommitment().isBlank()) {
        sb.append(String.format("  Role Time Commitment: %s\n", pos.getTimeCommitment()));
      }
      sb.append(String.format("  Technical Role: %s\n", isTechnicalRole(pos, pos.getRoleType()) ? "yes" : "no"));
      sb.append("\n");
    }
    return sb.toString();
  }

  private String buildStudentContext(String resumeText, StudentApplication application, Interview interview) {
    StringBuilder sb = new StringBuilder();
    if (application != null) {
      sb.append("### Application Details\n");
      if (application.getMajor() != null && !application.getMajor().isBlank()) {
        sb.append("Major: ").append(application.getMajor()).append("\n");
      }
      if (application.getRolePreferences() != null && !application.getRolePreferences().isEmpty()) {
        sb.append("Role Preferences: ").append(String.join(", ", application.getRolePreferences())).append("\n");
      }
      if (application.getStartupsAndIndustries() != null && !application.getStartupsAndIndustries().isBlank()) {
        sb.append("Industry/Startup Interests: ").append(application.getStartupsAndIndustries()).append("\n");
      }
      if (application.getContributionAndExperience() != null && !application.getContributionAndExperience().isBlank()) {
        sb.append("Contribution & Experience: ").append(application.getContributionAndExperience()).append("\n");
      }
      if (application.getWorkMode() != null && !application.getWorkMode().isBlank()) {
        sb.append("Work Mode: ").append(application.getWorkMode()).append("\n");
      }
      if (application.getTimeCommitment() != null && !application.getTimeCommitment().isBlank()) {
        sb.append("Time Commitment: ").append(application.getTimeCommitment()).append("\n");
      }
      sb.append("\n");
    }

    sb.append("### Resume\n").append(resumeText).append("\n\n");

    if (interview != null) {
      sb.append("### Interview Notes\n");
      if (interview.getRecommendation() != null) {
        sb.append("Recommendation: ").append(interview.getRecommendation()).append("\n");
      }
      if (interview.getBestFitRoleOrStartup() != null) {
        sb.append("Best Fit Role/Startup: ").append(interview.getBestFitRoleOrStartup()).append("\n");
      }
      if (interview.getSkillsAndExperience() != null) {
        sb.append("Skills & Experience: ").append(interview.getSkillsAndExperience()).append("\n");
      }
      if (interview.getPrimaryRoleInterest() != null) {
        sb.append("Primary Role Interest: ").append(interview.getPrimaryRoleInterest()).append("\n");
      }
      if (interview.getSecondaryRoleInterest() != null) {
        sb.append("Secondary Role Interest: ").append(interview.getSecondaryRoleInterest()).append("\n");
      }
      if (interview.getStartupInterests() != null) {
        sb.append("Startup Interests: ").append(interview.getStartupInterests()).append("\n");
      }
      if (interview.getRoleStructurePreference() != null && !interview.getRoleStructurePreference().isBlank()) {
        sb.append("Role Structure Preference: ").append(interview.getRoleStructurePreference()).append("\n");
      }
      if (interview.getWorkPreference() != null && !interview.getWorkPreference().isBlank()) {
        sb.append("Work Preference: ").append(interview.getWorkPreference()).append("\n");
      }
      if (interview.getCommitmentsAndConflicts() != null && !interview.getCommitmentsAndConflicts().isBlank()) {
        sb.append("Commitments & Conflicts: ").append(interview.getCommitmentsAndConflicts()).append("\n");
      }
      if (interview.getCommitmentConcerns() != null && !interview.getCommitmentConcerns().isBlank()) {
        sb.append("Commitment Concerns: ").append(interview.getCommitmentConcerns()).append("\n");
      }
    }

    return sb.toString();
  }

  private boolean isTechnicalRole(Startup.Position pos, String roleType) {
    StringBuilder sb = new StringBuilder();
    if (roleType != null) sb.append(roleType).append(' ');
    if (pos.getDescription() != null) sb.append(pos.getDescription()).append(' ');
    if (pos.getRequiredSkills() != null && !pos.getRequiredSkills().isEmpty()) {
      sb.append(String.join(" ", pos.getRequiredSkills()));
    }
    String text = sb.toString().toLowerCase(Locale.ROOT);
    return text.contains("engineer")
        || text.contains("engineering")
        || text.contains("developer")
        || text.contains("software")
        || text.contains("ml")
        || text.contains("machine learning")
        || text.contains("data")
        || text.contains("backend")
        || text.contains("frontend")
        || text.contains("full stack")
        || text.contains("fullstack")
        || text.contains("ai")
        || text.contains("devops")
        || text.contains("cloud");
  }

  private void enrichRoleScore(AiRecommendation.RoleScore rs, List<Startup> startups) {
    for (Startup startup : startups) {
      if (startup.getId().equals(rs.getStartupId()) && startup.getPositions() != null
          && rs.getPositionIndex() < startup.getPositions().size()) {
        rs.setStartupName(startup.getCompanyName());
        rs.setRoleType(startup.getPositions().get(rs.getPositionIndex()).getRoleType());
        return;
      }
    }
  }

  private Set<String> buildRoleKeySet(List<RoleReference> rankedRoles) {
    Set<String> keys = new HashSet<>();
    for (RoleReference roleRef : rankedRoles) {
      keys.add(toRoleKey(roleRef.getStartupId(), roleRef.getPositionIndex()));
    }
    return keys;
  }

  private String toRoleKey(String startupId, int positionIndex) {
    return startupId + "::" + positionIndex;
  }
}
