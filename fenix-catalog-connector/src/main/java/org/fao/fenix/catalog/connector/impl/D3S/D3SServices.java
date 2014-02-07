package org.fao.fenix.catalog.connector.impl.D3S;


public enum D3SServices {

    loadCodelist("msd/cl"), loadDataset("msd/dm"), searchDataset("find");

    private String path;
    private D3SServices(String path) {
        this.path = path;
    }
    public String getPath() { return path; }
}
