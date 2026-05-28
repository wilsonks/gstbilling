package com.wilsonks.gstbilling.invoice.sequence;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NextSequenceNumberDto {
    private Long sequenceId;
    private Long number;
    private String formattedNumber;
}