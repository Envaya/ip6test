// DATA
import "../../doc/serviceDoc.js";
import {localEntries} from "../../../example_implementations/repositories/localRepository.js";
import {tableConfig}  from "../config.js";

export { localTestService }

/**
 * This Service is only for testing purposes with 100 fix data entries.
 */

/**
 * Concrete factory for local {@link TableService} functions.
 * @constructor
 * @returns { TableService }
 */
const localTestService = () => {
    let totalData = null;

    const SIMULATED_FETCH_DELAY = tableConfig.testing.SIMULATED_FETCH_DELAY;

    // set initial data
    totalData = localEntries;

    /**
     * Fetch x entries fulfilling a filter from a local repository.
     * @param { !Filter } filter
     * @return
     */
    const applyFilter = (filter) => {
        let entriesProxy = totalData;

        /**
         * Filtering.
         */
        for (const [index, columnFilter] of filter.ColumnFilters.entries()) {
            if (columnFilter)  {
                entriesProxy = entriesProxy.filter(entry => entry[Object.keys(entry)[index]].toString().toLowerCase().includes(columnFilter));
            }
        }

        /**
         * Sorting.
         */
        if ( "desc" === filter.ColumnSorter.state ) {
            entriesProxy.sort((a, b) => a[Object.keys(a)[filter.ColumnSorter.column]] > b[Object.keys(b)[filter.ColumnSorter.column]] ? 1 : -1);
        } else if ( "asc" === filter.ColumnSorter.state ) {
            entriesProxy.sort((a, b) => a[Object.keys(a)[filter.ColumnSorter.column]] < b[Object.keys(b)[filter.ColumnSorter.column]] ? 1 : -1);
        }

        return entriesProxy;
    }

    /**
     * Fetches an array of  data entries.
     * Applies the received filter to the data set and returns the entries
     * ranging from startIndex to endIndex from that filtered subset.
     * The 2nd return value is length of the filtered subset.
     * The 3rd return value is the length of the original, unfiltered data.
     * All 3 values must be returned as an Array of promises.
     * @param { !Filter } filter
     * @param { !Number } startIndex
     * @param { !Number } endIndex
     * @returns { Promise<Object[]> }
     */
    const getDataWithFilter = (filter, startIndex, endIndex) => {
        const filteredData = applyFilter(filter);
        const filteredDataSubset = (filteredData.length < endIndex + 1) ? filteredData : filteredData.slice(startIndex, endIndex);

        const filteredDataSubsetPromise     = new Promise((resolve) => setTimeout(() => resolve(filteredDataSubset),  SIMULATED_FETCH_DELAY));
        const filteredDataSubsetSizePromise = new Promise((resolve) => setTimeout(() => resolve(filteredData.length), SIMULATED_FETCH_DELAY));
        const totalDataSizePromise          = new Promise((resolve) => setTimeout(() => resolve(totalData.length),    SIMULATED_FETCH_DELAY));

        return Promise.all([filteredDataSubsetPromise, filteredDataSubsetSizePromise, totalDataSizePromise]);
    }

    /**
     * Fetches a single data entry.
     * Applies the received filter to the data set and returns the entry
     * with the given index from that filtered subset.
     * @param { !Filter } filter
     * @param { !Number } index
     * @return { Promise<Entry> }
     */
    const getSingleDataEntry = (filter, index) =>
        new Promise((resolve) => setTimeout(() => resolve(applyFilter(filter)[index]), SIMULATED_FETCH_DELAY));

    return {
        getDataWithFilter,
        getSingleDataEntry,
        applyFilter         //only exposed for test purposes
    }
}