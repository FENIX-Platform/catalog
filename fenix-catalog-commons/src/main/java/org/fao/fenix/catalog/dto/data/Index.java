package org.fao.fenix.catalog.dto.data;

import java.util.Map;

public class Index {
    private IndexType type;
    private Map<String,Object> properties;

    public IndexType getType() {
        return type;
    }

    public void setType(IndexType type) {
        this.type = type;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, Object> properties) {
        this.properties = properties;
    }
}
