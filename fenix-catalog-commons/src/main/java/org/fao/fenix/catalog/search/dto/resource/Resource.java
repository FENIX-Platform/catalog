package org.fao.fenix.catalog.search.dto.resource;

import org.fao.fenix.catalog.search.dto.resource.data.DataType;
import org.fao.fenix.catalog.search.dto.resource.dsd.ResourceDSD;
import org.fao.fenix.catalog.search.dto.resource.index.Index;

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
