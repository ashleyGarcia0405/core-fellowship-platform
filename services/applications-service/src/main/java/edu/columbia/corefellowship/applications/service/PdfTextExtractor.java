package edu.columbia.corefellowship.applications.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.Storage;
import edu.columbia.corefellowship.applications.config.GcsProperties;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class PdfTextExtractor {

  private final Storage storage;
  private final GcsProperties gcsProperties;

  public PdfTextExtractor(Storage storage, GcsProperties gcsProperties) {
    this.storage = storage;
    this.gcsProperties = gcsProperties;
  }

  public String extractText(String blobName) {
    BlobId blobId = BlobId.of(gcsProperties.getBucketName(), blobName);
    Blob blob = storage.get(blobId);

    if (blob == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume file not found in storage");
    }

    byte[] pdfBytes = blob.getContent();

    try (PDDocument document = Loader.loadPDF(pdfBytes)) {
      PDFTextStripper stripper = new PDFTextStripper();
      return stripper.getText(document);
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to extract text from resume PDF", e);
    }
  }
}
