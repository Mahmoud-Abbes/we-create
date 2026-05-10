package com.wecreate.api.shared.dtos.llmconnector.showcase;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowcaseRequest {
    private Map<String, Object> userContext;
    private List<UserAsset> userAssets;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserAsset {
        private String imageName;
        private String byteData;
    }
}