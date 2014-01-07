package org.fao.fenix.catalog.dto.data;

import org.fao.fenix.catalog.dto.data.dsd.ResourceDSD;

import java.util.Map;

public interface Resource {

    public abstract String getName();
    public abstract String getSourceName();
    public abstract Map<String,Object> getMetadata();

    public abstract DataType getDataType();
    public abstract Object getData();
    public abstract ResourceDSD getDSD();
    public abstract Integer getSize();

}
