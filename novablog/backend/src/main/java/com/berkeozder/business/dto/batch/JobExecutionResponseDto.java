package com.berkeozder.business.dto.batch;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobExecutionResponseDto implements Serializable {

    private Long jobExecutionId;
    private String jobName;
    private String status;
    private String exitCode;
    private String exitDescription;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Europe/Istanbul")
    private Date startTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Europe/Istanbul")
    private Date endTime;

    private Long durationMs;
    private Map<String, Object> parameters;
    private List<StepExecutionSummaryDto> stepExecutions;
}

