package com.flogin.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Category {
    DIEN_TU("Điện tử"),
    THOI_TRANG("Thời trang"),
    GIA_DUNG("Gia dụng"),
    THUC_PHAM("Thực phẩm"),
    SAC_DEP("Sắc đẹp"),
    THE_THAO("Thể thao"),
    KHAC("Khác");

    private final String displayName;
}
