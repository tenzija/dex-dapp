import { ethers } from "ethers";
import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import moment from "moment";

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
const account = state => get(state, 'provider.account')
const events = state => get(state, 'exchange.events')

const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
        return(orderFilled || orderCancelled)
    })

    return openOrders
}

// my events

export const myEventsSelector = createSelector(
    account, events,
    (account, events) => {
        events = events.filter((e) => e.args.user === account)
        return events
    }
)

// my open orders

export const myOpenOrdersSelector = createSelector(account, tokens, openOrders, (
    account, tokens, orders
) => {
    if (!tokens[0] || !tokens[1]) { return }
    
    // fillter orders created by current acc
    orders = orders.filter((o) => o.user === account)

    // filter orders by selecred token
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // decorate orders
    orders = decorateMyOpenOrders(orders, tokens)

    // sort orders by date desc
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    return orders
})

const decorateMyOpenOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order, tokens)
            return(order)
        })
    )
}

const decorateMyOpenOrder = (order, tokens) => {
    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
}

const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount

    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive
        token1Amount = order.amountGet
    } else {
        token0Amount = order.amountGet
        token1Amount = order.amountGive
    }

    // add decimal places to price
    const precision = 100000
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
        token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

// all filled orders

export const filledOrdersSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }
    
    // filter orders by selecred token
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // sort orders by time asc for price comparison
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    // decorate orderes
    orders = decorateFilledOrders(orders, tokens)

    // sort orders for dispaly
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    return orders
})

const decorateFilledOrders = (orders, tokens) => {
    // track previous order
    let previousOrder = orders[0]

    return (
        orders.map((order) => {
            // decorate each order
            order = decorateOrder(order, tokens)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order // update the previous order once its decorated
            return order
        })
    )
}

const decorateFilledOrder = (order ,previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

// for the color of dispaly price
const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if (previousOrder.id === orderId) {
        return GREEN
    }

    if (previousOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED
    }
}

// my filled orders

export const myFilledOrdersSelector = createSelector(account, tokens, filledOrders, (
    account, tokens, orders
) => {
    if (!tokens[0] || !tokens[1]) { return }

    // find our orders
    orders = orders.filter((o) => o.user === account || o.creator === account)

    // filter orders by selecred token
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // sort orders by date desc
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    // decorate myFilledOrders
    orders = decorateMyFilledOrders(orders, account, tokens)

    return orders
})

const decorateMyFilledOrders = (orders, account, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order, account, tokens)
            return(order)
        })
    )
}

const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order.creator === account

    let orderType
    if(myOrder) {
        orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    } else {
        orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
    }

    return({
        ...order,
        orderType,
        orderClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })
}

// order book

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // filter orders by selecred token
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // visual imporvment regarding orders
    orders = decorateOrderBookOrders(orders, tokens)

    // grouping orders based on buy/sell
    orders = groupBy(orders, 'orderType')

    // fetch buy orders
    const buyOrders = get(orders, 'buy', [])

    // sort buy orders by token price
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    // fetch sell orders
    const sellOrders = get(orders, 'sell', [])

    // sort sell orders by token price
    orders = {
        ...orders,
        sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    return orders
})

const decorateOrderBookOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return(order)
        })
    )
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}

// price chart

export const priceChartSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // filter orders by selecred token
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // sort orders by date desc
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    // decorate orders aka format them
    orders = orders.map((o) => decorateOrder(o, tokens))

    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2 , orders.length)

    // last price
    const lastPrice = get(lastOrder, 'tokenPrice', 0)

    // second last price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return ({ 
        lastPrice,
        lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
        series: [{
            // candlestic infro goes in data see graphData for the correct format
            data: buildGraphData(orders)
        }] 
    })
})

const buildGraphData = (orders) => {
    // group the orders by the hour for the graph
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

    // get each hour where data exists
    const hours = Object.keys(orders)

    // building the graph
    const graphData = hours.map((hour) => {
        // fetch all orders from current hour
        const group = orders[hour]

        // calculate: open, high, low, close
        const open = group[0]
        const high = maxBy(group, 'tokenPrice')
        const low = minBy(group, 'tokenPrice')
        const close = group[group.length - 1]
        
        return({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
    })

    return graphData
}
