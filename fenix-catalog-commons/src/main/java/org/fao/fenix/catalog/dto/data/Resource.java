package org.fao.fenix.catalog.dto.data;

import org.fao.fenix.catalog.dto.data.dsd.ResourceDSD;

import java.util.Map;

public interface Resource {

    public String getType();
    public String getName();
    public String getSource();

    public Index getIndex();

    public Map<String,Object> getMetadata();

    public Object getData();
    public DataType getDataType();
    public ResourceDSD getDSD();
    public Integer getCount();

}
