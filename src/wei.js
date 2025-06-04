

    import BigNumber from 'bignumber.js';

    BigNumber.config({
        DECIMAL_PLACES: 18,
        EXPONENTIAL_AT: [-18, 18],
        ROUNDING_MODE: BigNumber.ROUND_HALF_CEIL,
        CRYPTO: true,
        MODULO_MODE: BigNumber.ROUND_FLOOR,
        POW_PRECISION: 80
    })

    const power = function (token) {
        return (token && token.decimals) ? parseInt(token.decimals) : 18;
    }
    const factor = function (_power_) {
        return Math.pow(10, _power_);
    }

    function _themaths_(decimals){
        let _p = power({ decimals });
        let _f = factor(_p);

        const fromWei = function (amount) {
            let base = (typeof amount === "string" && amount.startsWith("0x")) ? 16:10;
            let input = new BigNumber(amount, base);
            return input.div(new BigNumber(_f)).toString();
        }

        const toWei = function (amount) {
            let deci = new BigNumber(`${amount}`).split(".");
            let dplc = (deci.length > 1) ?
                _p : 0;

            let trunc = (dplc > 0) ?
                new BigNumber(amount).toFixed(dplc) :
                BigInt(amount)

            let finB = new BigNumber(_f).times(new BigNumber(trunc));

            return finB.toString();
        }

        return {
            fromWei,
            toWei
        }
    }

    export default {
        gasPrice:  _themaths_(9),
        useToken(token) {
            return _themaths_(token?.decimals);   
        },
        ETH: _themaths_(18),
        decimals: _themaths_
    }

