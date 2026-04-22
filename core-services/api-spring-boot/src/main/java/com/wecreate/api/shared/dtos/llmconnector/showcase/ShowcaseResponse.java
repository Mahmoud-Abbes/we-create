package com.wecreate.api.shared.dtos.llmconnector.showcase;

import lombok.Data;
import java.util.Map;

@Data
public class ShowcaseResponse {
    private String status;
    private Map<String, Object> site_config;
}