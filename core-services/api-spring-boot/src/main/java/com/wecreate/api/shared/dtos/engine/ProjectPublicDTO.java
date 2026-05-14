package com.wecreate.api.shared.dtos.engine;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectPublicDTO {
    private String jsonContent;
    private String projectType;
}