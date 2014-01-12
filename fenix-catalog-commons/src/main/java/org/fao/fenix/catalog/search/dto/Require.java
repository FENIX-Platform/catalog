package org.fao.fenix.catalog.search.dto;

import org.codehaus.jackson.annotate.JsonIgnore;

public class Require {
    private boolean index = true;
    private String[] metadata;
    private String[] data;


    public boolean hasIndex() {
        return index;
    }

    public void setIndex(boolean index) {
        this.index = index;
    }

    public boolean hasMetadata() {
        return metadata!=null;
    }

    @JsonIgnore
    public String[] getMetadataColumns() {
        return metadata;
    }

    public void setMetadata(Object metadata) {
        if (metadata!=null)
            this.metadata = metadata instanceof Boolean ? new String[0] : (String[])metadata;
    }

    public boolean hasData() {
        return data!=null;
    }

    @JsonIgnore
    public String[] getDataColumns() {
        return data;
    }

    public void setData(Object data) {
        if (data!=null)
            this.data = data instanceof Boolean ? new String[0] : (String[])data;
    }
}
