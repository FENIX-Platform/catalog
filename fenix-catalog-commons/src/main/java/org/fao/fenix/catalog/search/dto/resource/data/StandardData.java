package org.fao.fenix.catalog.search.dto.resource.data;

import org.fao.fenix.catalog.search.dto.resource.index.Index;
import org.fao.fenix.catalog.search.dto.resource.Resource;

import java.util.HashMap;

public abstract class StandardData implements Resource {

    private String name;
    private String resourceType;
    private String sourceName;
    private Object metadata;
    private Integer size;
    private Index index;

    public StandardData() { }
    public StandardData(String name, String resourceType, String sourceName, Index index, Object metadata, Integer size) {
        this.name = name;
        this.resourceType = resourceType;
        this.sourceName = sourceName;
        this.index = index;
        this.metadata = metadata!=null ? metadata : new HashMap<String,Object>();
        this.size = size;
    }

    @Override
    public String getResourceType() {
        return resourceType;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getSource() {
        return sourceName;
    }

    @Override
    public Index getIndex() {
        return index;
    }


    @Override
    public Object getMetadata() {
        return metadata;
    }

    @Override
    public DataType getDataType() {
        return DataType.table;
    }


    @Override
    public Integer getCount() {
        return size;
    }

}
