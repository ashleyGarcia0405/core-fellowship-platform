package edu.columbia.corefellowship.applications.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import edu.columbia.corefellowship.applications.config.GcsProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Service
public class StorageService {

  private final Storage storage;
  private final GcsProperties gcsProperties;

  public StorageService(Storage storage, GcsProperties gcsProperties) {
    this.storage = storage;
    this.gcsProperties = gcsProperties;
  }

  /**
   * Upload a file to Google Cloud Storage.
   *
   * @param file     The file to upload
   * @param userId   The user ID (for organizing files)
   * @param fileName The desired file name
   * @return The GCS blob name (path in the bucket)
   */
  public String uploadFile(MultipartFile file, String userId, String fileName) {
    // Validate file
    validateFile(file);

    // Create blob path: resumes/{userId}/{fileName}
    String blobName = String.format("resumes/%s/%s", userId, fileName);

    try {
      BlobId blobId = BlobId.of(gcsProperties.getBucketName(), blobName);
      BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
          .setContentType(file.getContentType())
          .build();

      storage.create(blobInfo, file.getBytes());
      return blobName;

    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload file", e);
    }
  }

  /**
   * Generate a signed URL for downloading a file.
   * Valid for 15 minutes.
   *
   * @param blobName The GCS blob name
   * @return Signed URL for downloading
   */
  public String getSignedUrl(String blobName) {
    BlobId blobId = BlobId.of(gcsProperties.getBucketName(), blobName);
    Blob blob = storage.get(blobId);

    if (blob == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
    }

    return blob.signUrl(15, TimeUnit.MINUTES).toString();
  }

  /**
   * Delete a file from GCS.
   *
   * @param blobName The GCS blob name
   */
  public void deleteFile(String blobName) {
    BlobId blobId = BlobId.of(gcsProperties.getBucketName(), blobName);
    boolean deleted = storage.delete(blobId);

    if (!deleted) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "File not found or already deleted");
    }
  }

  /**
   * Validate uploaded file.
   */
  private void validateFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    long maxSize = 5 * 1024 * 1024;
    if (file.getSize() > maxSize) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "File size exceeds 5MB limit");
    }

    // Check file type (must be PDF)
    String contentType = file.getContentType();
    if (contentType == null || !contentType.equals("application/pdf")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "File must be a PDF");
    }

    // Check file extension
    String originalFilename = file.getOriginalFilename();
    if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "File must have .pdf extension");
    }
  }
}