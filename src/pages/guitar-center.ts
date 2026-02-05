import * as cheerio from 'cheerio';
import type { APIRoute } from 'astro';
import type { Merch } from '../types/merch';
type Category = 'Guitars' | 'Amplifiers-Effects' | '';

const processMerch = ($: any, $merch: any) => {
    const allMerch: Merch[] = [];

    $merch.each((_i: any, element: any) => {
        const merch: Merch = {
            name: '',
            imageUrl: '',
            price: '',
            link: '',
            location: '',
        };

        let $name = $(element).find('a.product-name');
        merch.name = $name.text().replace('Used ', '');
        merch.imageUrl = $(element).find('img').attr('src');
        merch.price = $(element).find('.price').text();
        merch.link = 'https://www.guitarcenter.com/' + $name.attr('href');
        merch.location = $(element).find('.store-name-text').text();

        allMerch.push(merch);
    });

    return allMerch;
};

const getItemsByCategory = async (category: Category = '') => {
    try {
        // https://www.guitarcenter.com/Used?icid=LP8673&filters=stores:Twin%20Cities|Oakdale|Bloomington|Maple%20Grove&recsPerPage=48
        // https://www.guitarcenter.com/Used/Amplifiers-Effects.gc?filters=stores:Twin%20Cities|Oakdale|Bloomington|Maple%20Grove&facetChangeCategory=Amplifiers%20%26%20Effects
        const categoryQuery = category ? `/${category}.gc?` : '?icid=LP8673&';
        const url = `https://www.guitarcenter.com/Used${categoryQuery}filters=stores:Maple%20Grove|Bloomington|Oakdale|Twin%20Cities&Ns=cD&recsPerPage=100`;
        const $ = await cheerio.fromURL(url);
        const $merch = $('section.plp-product-grid');

        return processMerch($, $merch);
    } catch(error) {
        console.error('getItemsByCategory ERROR');
        console.error(error);

        return [];
    }
};

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const category = url.searchParams.get('category') as Category || '';
        const data = await getItemsByCategory(category); // TODO dedupe list

        return Response.json(JSON.stringify({ data }));
    } catch (err) {
        console.error('500 error in get', err);
        return new Response(null, {
            status: 500,
        });
    }
}
