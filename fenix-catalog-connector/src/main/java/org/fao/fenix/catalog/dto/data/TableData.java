package org.fao.fenix.catalog.dto.data;

import org.fao.fenix.catalog.dto.data.dsd.ResourceDSD;
import org.fao.fenix.catalog.dto.data.dsd.TableDSD;

import java.util.HashMap;
import java.util.Map;

public class TableData implements Resource {

    private String name;
    private String sourceName;
    private Map<String, Object> metadata;
    private TableDSD DSD;
    private Integer size;
    private Iterable<Object[]> data;

    public TableData(String name, String sourceName, Map<String, Object> metadata, TableDSD DSD, Iterable<Object[]> data, Integer size) {
        this.name = name;
        this.sourceName = sourceName;
        this.metadata = metadata!=null ? metadata : new HashMap<String,Object>();
        if ((this.data = data)!=null) {
            this.DSD = DSD!=null ? DSD : new TableDSD();
            this.size = size;
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getSourceName() {
        return sourceName;
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
    public void addColumn(String columnName, Map<String,Object> columnMetadata) {
        DSD.put(columnName, columnMetadata);
    }

    @Override
    public Integer getSize() {
        return size;
    }
}
