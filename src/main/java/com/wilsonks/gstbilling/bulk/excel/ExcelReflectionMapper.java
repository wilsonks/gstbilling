package com.wilsonks.gstbilling.bulk.excel;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ExcelReflectionMapper {

    private final Map<String, Field> fieldCache =
            new ConcurrentHashMap<>();

    public Object getFieldValue(
            Object target,
            String fieldName) {

        if (target == null) {
            return null;
        }

        try {

            Field field =
                    resolveField(
                            target.getClass(),
                            fieldName);

            field.setAccessible(true);

            return field.get(target);

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Failed reading field: "
                            + fieldName,
                    ex);
        }
    }

    public void setFieldValue(
            Object target,
            String fieldName,
            String rawValue) {

        if (target == null) {
            return;
        }

        try {

            Field field =
                    resolveField(
                            target.getClass(),
                            fieldName);

            field.setAccessible(true);

            Object converted =
                    convert(
                            rawValue,
                            field.getType());

            field.set(target, converted);

        } catch (Exception ex) {

            throw new IllegalArgumentException(
                    "Failed mapping field "
                            + fieldName
                            + " with value ["
                            + rawValue
                            + "]",
                    ex);
        }
    }

    private Field resolveField(
            Class<?> clazz,
            String fieldName)
            throws NoSuchFieldException {

        String cacheKey =
                clazz.getName()
                        + "#"
                        + fieldName;

        Field field =
                fieldCache.get(cacheKey);

        if (field != null) {
            return field;
        }

        Class<?> current = clazz;

        while (current != null) {

            try {

                field =
                        current.getDeclaredField(
                                fieldName);

                fieldCache.put(
                        cacheKey,
                        field);

                return field;

            } catch (NoSuchFieldException ignored) {

                current =
                        current.getSuperclass();
            }
        }

        throw new NoSuchFieldException(
                fieldName);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private Object convert(
            String value,
            Class<?> targetType) {

        if (value == null ||
                value.isBlank()) {

            if (targetType.isPrimitive()) {

                if (targetType == boolean.class) {
                    return false;
                }

                if (targetType == int.class) {
                    return 0;
                }

                if (targetType == long.class) {
                    return 0L;
                }

                if (targetType == double.class) {
                    return 0D;
                }
            }

            return null;
        }

        value = value.trim();

        if (String.class.equals(targetType)) {
            return value;
        }

        if (Long.class.equals(targetType)
                || long.class.equals(targetType)) {

            return Long.parseLong(value);
        }

        if (Integer.class.equals(targetType)
                || int.class.equals(targetType)) {

            return Integer.parseInt(value);
        }

        if (Double.class.equals(targetType)
                || double.class.equals(targetType)) {

            return Double.parseDouble(value);
        }

        if (Boolean.class.equals(targetType)
                || boolean.class.equals(targetType)) {

            return Boolean.parseBoolean(value);
        }

        if (BigDecimal.class.equals(targetType)) {

            return new BigDecimal(value);
        }

        if (Enum.class.isAssignableFrom(targetType)) {

            return Enum.valueOf(
                    (Class<Enum>) targetType,
                    value.trim()
                            .toUpperCase());
        }

        throw new IllegalArgumentException(
                "Unsupported field type: "
                        + targetType.getName());
    }
}