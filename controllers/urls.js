const { save } = require('debug/src/browser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const urls = require('../models/urls');

exports.urlsController = {
  // function to create short url using shortid library
  createShortUrl: (req, res) => {
    const url = req.body;
    req.body.shortUrl = `http://sh.l/${shortid.generate()}`;
    req.body.clicks = 0;
    urls
      .create(url)
        .then((data) => {
          res
            .status(200)
            .json({
              status: "Ok",
              shortUrl: data.shortUrl
            })
        })
        .catch((err) => {
          if (err.code == 11000) {
            urls
              .findOne({url: req.body.url})
              .then((data) => {
                res
                  .json(data.shortUrl);
              })
          } else {
            res
            .status(400)
            .send(err);
          };
        })
  }, 
  // function to get main url
  getByShortUrl: (req, res) => {
    const shortUrl = req.body.shortUrl;
    urls
     .findOne({shortUrl: shortUrl})
        .then((data) => {
        if(!data) {
          res 
            .status(404)
            .json({
              status: "failed",
              message: "url not found"
            })
        }
        data.clicks++;
        data.save();
          res
            .status(200)
            .json(data.url)
        })
        .catch((err) => {
          res.status(400)
             .send(err.message)
             console.log(err);
        })
  },
  // function to get url statistics
  getStatistics: (req, res) => {
    const urlPath = req.params.urlPath;
    const shortUrl = `http://sh.l/${urlPath}`;
    urls
      .findOne({shortUrl: shortUrl})
      .then((data) => {
        if (!data) {
          res 
            .status(404)
            .json({
              status: "failed",
              message: "url not found"
            })
        }
        res 
            .status(200)
            .json({
              status: "Ok",
              url: data.url,
              clicks: data.clicks
            })
      })
      .catch((err) => {
        res 
          .status(400)
          .send({
            status: "failed",
            err
          })
      })
  }, 
  // Get all url collections from database
  getAllData: (req, res) => {
    urls
      .find()
        .then((data) => {
          res
            .status(200)
            .render('index', {
              title: 'Indicina',
              data: data
            });
        })
        .catch((err) => {
          res
            .status(400)
            .send(err)
        })
  }
};