package com.wecreate.api.shared.dtos.llmconnector.showcase;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowcaseResponse {
    private String creationStatus;
    private String projectId;
}