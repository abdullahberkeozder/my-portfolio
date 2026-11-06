package com.berkeozder.business.dto.batch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StepExecutionSummaryDto implements Serializable {

    private String stepName;
    private String status;
    private long readCount;
    private long writeCount;
    private long filterCount;
    private long skipCount;
    private long commitCount;
    private long rollbackCount;
    private String exitCode;
}

