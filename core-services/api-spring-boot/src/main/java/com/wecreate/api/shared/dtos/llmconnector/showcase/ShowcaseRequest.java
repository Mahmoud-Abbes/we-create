package com.wecreate.api.shared.dtos.llmconnector.showcase;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class ShowcaseRequest {
    // Matches "userContext" key in FastAPI
    private Map<String, Object> userContext;
}
