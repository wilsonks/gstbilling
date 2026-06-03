package com.wilsonks.gstbilling.bulk.excel;

public interface DuplicateKeyProvider<T> {

    String duplicateKey(T dto);
}