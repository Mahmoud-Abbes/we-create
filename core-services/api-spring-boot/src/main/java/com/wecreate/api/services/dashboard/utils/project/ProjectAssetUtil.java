package com.wecreate.api.services.dashboard.utils.project;

import com.wecreate.api.shared.dtos.llmconnector.showcase.ShowcaseRequest;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProjectAssetUtil {

    private final Gson gson;
    private final S3Client s3Client;

    @Value("${supabase.bucket-name}")
    private String bucket;

    @Value("${supabase.s3.endpoint}")
    private String endpoint;

    public String handleAssetsAndRefactorJson(ShowcaseRequest request, UUID projectId) throws Exception {
        // Convert the context to a string once for replacement
        String jsonContext = gson.toJson(request.getUserContext());

        // Logic: For each userAsset, upload and refactor
        for (ShowcaseRequest.UserAsset asset : request.getUserAssets()) {
            String originalName = asset.getImageName();

            // 1. Generate unique filename: projectId + currentTime + originalName
            String newName = projectId + "_" + System.currentTimeMillis() + "_" + originalName;

            // 2. Upload to Supabase (Decode Base64 string to bytes)
            String raw = asset.getByteData();
            if (raw == null || raw.isBlank()) {
                throw new IllegalArgumentException("Asset byteData is missing for imageName=" + originalName);
            }

            // Frontends often send data URLs like: data:image/png;base64,AAAA...
            int base64Marker = raw.indexOf("base64,");
            if (base64Marker >= 0) {
                raw = raw.substring(base64Marker + "base64,".length());
            }

            // Be tolerant to line breaks and other MIME formatting
            byte[] decodedBytes = Base64.getMimeDecoder().decode(raw.trim());

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(newName)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(decodedBytes));

            // 3. Construct URL and replace all instances of originalName in the JSON string
            String publicUrl = endpoint.replace("/s3", "/object/public") + "/" + bucket + "/" + newName;
            jsonContext = jsonContext.replace(originalName, publicUrl);
        }

        return jsonContext;
    }

    /**
     * Logic Step: Delete all files in Supabase storage that start with the projectId.
     */
    public void rollbackFirebaseUploads(UUID projectId) {
        System.out.println("Cleaning up Supabase files starting with: " + projectId);
        try {
            // Find all files starting with projectId
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucket)
                    .prefix(projectId.toString())
                    .build();

            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);

            // Delete discovered files
            for (S3Object s3Object : listResponse.contents()) {
                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(bucket)
                        .key(s3Object.key())
                        .build();
                s3Client.deleteObject(deleteRequest);
            }
        } catch (Exception e) {
            System.err.println("Rollback failed for storage: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public String extractCompanyName(ShowcaseRequest request) {
        try {
            Map<String, Object> context = (Map<String, Object>) request.getUserContext();
            Map<String, Object> identity = (Map<String, Object>) context.get("identity");
            return identity.get("companyName").toString();
        } catch (Exception e) {
            return "untitled-project";
        }
    }
}