package com.berkeozder.audit;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

/**
 * Base DTO containing audit tracking fields.
 */
@Getter
@Setter
public abstract class AuditingAwareBaseDto {

    private String createdBy;
    private Date createdDate;
    private String lastUserBy;
    private Date lastUserDate;
}
