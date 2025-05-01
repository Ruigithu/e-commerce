package com.ruipeng.e_commrce.service_product.entity;

public enum ProductCategoryEnum {
    ELECTRONICS("Electronics", "Including phones, computers, cameras and other electronic devices"),
    CLOTHING("Clothing", "Men's wear, women's wear, children's clothing and accessories"),
    HOME_APPLIANCES("Home Appliances", "Kitchen appliances, household appliances, etc."),
    BOOKS("Books", "Physical books, e-books, etc."),
    FOOD("Food", "Snacks, beverages, fresh food, etc."),
    BEAUTY("Beauty", "Cosmetics, skincare products, etc."),
    SPORTS("Sports & Outdoors", "Sports equipment, outdoor gear, etc."),
    TOYS("Toys", "Various toys and games");

    private final String displayName;
    private final String description;

    ProductCategoryEnum(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
