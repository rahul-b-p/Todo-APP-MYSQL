import { FunctionStatus } from "../enums";
import { PageInfo, PaginationLinks, PaginationParams } from "../types";
import { logFunctionInfo } from "../utils/logger";


/**
 * Retrieves pagination links, including URLs for the next page, previous page, and first page, 
 * based on the provided page information and current page URL.
*/
export const getPaginationLinks = (pageInfo: PageInfo, url: string): PaginationLinks => {
    const functionName = 'pagenate';
    logFunctionInfo(functionName, FunctionStatus.START);

    const { page, totalPages } = pageInfo;

    const Pageurl = (pageNo: number) => {
        return url.replace('?pageNo=1', `?pageNo=${pageNo}`)
    }

    const paginationLinks: PaginationLinks = {
        nextPage: null,
        prevPage: null,
        firstPage: null,
        lastPage: null
    };

    if (page > 1) {
        paginationLinks.prevPage = Pageurl(page - 1);
        paginationLinks.firstPage = Pageurl(1);
    }
    if (page < totalPages) {
        paginationLinks.lastPage = Pageurl(totalPages);
        paginationLinks.nextPage = Pageurl(page + 1);
    }

    logFunctionInfo(functionName, FunctionStatus.SUCCESS);
    return paginationLinks;
}

/**
 * To get the page nation required params like page,limit and skip.
 */
export const getPaginationParams = (pageNo: string, pageLimit: string): PaginationParams => {
    const page = Number(pageNo);
    const limit = Number(pageLimit);
    const skip = (page - 1) * limit;

    return {
        page, limit, skip
    }
};