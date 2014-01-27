package org.fao.fenix.catalog.search.dto.data;

import java.util.Map;

public class Index {
    private IndexType type;
    private Map<String,Object> properties;

    public Index() {}
    public Index(IndexType type, Map<String, Object> properties) {
        this.type = type;
        this.properties = properties;
    }

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
