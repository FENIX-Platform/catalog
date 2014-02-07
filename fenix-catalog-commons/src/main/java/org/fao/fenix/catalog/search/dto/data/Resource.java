package org.fao.fenix.catalog.search.dto.data;

import org.fao.fenix.catalog.search.dto.data.dsd.ResourceDSD;

import java.util.Map;

public interface Resource {

    public String getResourceType();
    public String getName();
    public String getSource();

    public Index getIndex();

    public Object getMetadata();

    public Object getData();
    public DataType getDataType();
    public ResourceDSD getDSD();
    public Integer getCount();

}
