package org.fao.fenix.catalog.search.dto.data.dsd;

import java.util.LinkedHashMap;

public class CodeListDSD implements ResourceDSD {

    public static enum CodeListStructure {
        list,tree,graph;
    }

    private CodeListStructure type;

    public CodeListDSD() {}

    public CodeListDSD(CodeListStructure type) {
        this.type = type;
    }

    public CodeListStructure getType() {
        return type;
    }

    public void setType(CodeListStructure type) {
        this.type = type;
    }
}
