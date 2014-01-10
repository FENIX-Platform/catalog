package org.fao.fenix.catalog.dto.data;

import org.fao.fenix.catalog.dto.data.dsd.ResourceDSD;
import org.fao.fenix.catalog.dto.data.dsd.TableDSD;

import java.util.HashMap;
import java.util.Map;

public class TableData implements Resource {

    private String name;
    private String resourceType;
    private String sourceName;
    private Map<String, Object> metadata;
    private TableDSD DSD;
    private Integer size;
    private Iterable<Object[]> data;
    private Index index;

    public TableData() { }
    public TableData(String name, String resourceType, String sourceName, Index index, Map<String, Object> metadata, TableDSD DSD, Iterable<Object[]> data, Integer size) {
        this.name = name;
        this.resourceType = resourceType;
        this.sourceName = sourceName;
        this.index = index;
        this.metadata = metadata!=null ? metadata : new HashMap<String,Object>();
        if ((this.data = data)!=null) {
            this.DSD = DSD!=null ? DSD : new TableDSD();
            this.size = size;
        }
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
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    public void addMetadata(String fieldName, Object fieldValue) {
        metadata.put(fieldName, fieldValue);
    }

    @Override
    public DataType getDataType() {
        return DataType.table;
    }

    @Override
    public Object getData() {
        return data;
    }

    @Override
    public ResourceDSD getDSD() {
        return DSD;
    }

    @Override
    public Integer getCount() {
        return size;
    }

    public void addColumn(String columnName, Map<String,Object> columnMetadata) {
        DSD.put(columnName, columnMetadata);
    }

}
